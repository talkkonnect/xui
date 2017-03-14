--[[
/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2013-2017, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

	Catch Event in Lua: lua.conf.xml

	<hook event="CUSTOM" subclass="fifo::info" script="/usr/local/freeswitch/xui/lua/xui/catch-event.lua"/>
]]

print(event:serialize())

cidName=event:getHeader("Caller-Caller-ID-Name")
cidNumber=event:getHeader("Caller-ANI")
destNumber=event:getHeader("Other-Leg-Destination-Number") or event:getHeader("Caller-Destination-Number")
fifoAction = event:getHeader("FIFO-Action")
httpFifoNotificationURL = nil -- "http://localhost:9999/"

if fifoAction == "push" or fifoAction == "abort" or fifoAction == "pre-dial" or fifoAction == "bridge-caller-start" or fifoAction == "bridge-caller-stop" or fifoAction == "consumer_stop" then

	local cur_dir = debug.getinfo(1).source;
	cur_dir = string.gsub(debug.getinfo(1).source, "^@(.+/)[^/]+$", "%1")

	package.path = package.path .. ";" .. cur_dir .. "vendor/?.lua"

	require 'utils'
	require 'xtra_config'
	require 'xdb'

	if config.db_auto_connect then xdb.connect(config.fifo_cdr_dsn or config.dsn) end

	httpFifoNotificationURL = config.httpFifoNotificationURL

	uuid = event:getHeader("Unique-ID")
	fifo_name = event:getHeader("Fifo-Name")
	record_path = event:getHeader("variable_fifo_record_template")
	record_name = event:getHeader("variable_fifo_timestamp")
	
	if fifoAction == "push" then
		rec = {}
		rec.channel_uuid = uuid
		rec.fifo_name = fifo_name
		rec.ani = cidNumber
		rec.dest_number = destNumber
		rec.start_epoch = "" .. os.time() + config.tz*60*60
		xdb.create('fifo_cdrs', rec)
	elseif fifoAction == "pre-dial" then
	elseif fifoAction == "bridge-caller-start" then
		rec = {}
		rec.bridged_number = destNumber
		rec.bridge_epoch = "" .. os.time() + config.tz*60*60

		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, rec)
	elseif fifoAction == "bridge-caller-stop" then
		rec = {}
		rec.end_epoch = "" .. os.time() + config.tz*60*60
		
		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, rec)
	elseif fifoAction == "abort" then
		rec = {}
		rec.end_epoch = "" .. os.time() + config.tz*60*60
		
		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, rec)
	elseif fifoAction == "consumer_stop" then
		uuid = event:getHeader("variable_bridge_uuid")
		rec = {}
		id = {}
		local a, b, c, d, e, f, g, h, i = string.match(record_path, "(%a+)-(%a+)-(%d+)-(%d+)-(%w+)-(%w+)-(%w+)-(%w+)-(%w+)")
		original_name = a .. '-' .. b ..'-'.. c .. '-'.. d .. '-' .. e .. '-' .. f .. '-' .. g .. '-' .. h .. '-' .. i .. ".mp3"
		local f = assert(io.open(record_path),"rb")
	        local size = assert(f:seek("end"))
        	rec.name = "fifo-record-" .. record_name
        	rec.mime = "audio/mp3"
        	rec.abs_path = record_path
        	rec.file_size = "" .. size
        	rec.description = 'fiforecord'
        	rec.dir_path = config.fiforecord_path
        	rec.channel_uuid = uuid
        	rec.created_epoch = "" .. os.time()
		rec.original_file_name = original_name
		
		xdb.create('media_files', rec)

		sql = "select id from media_files where channel_uuid = " .. '\"' .. uuid .. '\"' .. ";"
		xdb.find_by_sql(sql,function(row)
			id.media_file_id = row.id
		end)
	
		xdb.update_by_cond('fifo_cdrs', {channel_uuid = uuid}, id)
		
	end
end

if httpFifoNotificationURL and fifoAction == "bridge-caller-start" then
	api = freeswitch.API()
	local url = httpFifoNotificationURL .. fifoAction .. "/" .. cidNumber .. "/" .. destNumber
	local args = "curl " .. url
	print(args)
	api:execute("bgapi", args)
end
