local kong = kong
local http = require "resty.http"
local utils = require "kong.tools.utils"
local cjson = require "cjson"

local TokenHandler = {
  VERSION = "1.0",
  PRIORITY = 1000,
}

local function introspect_access_token(conf, path, access_token, store_id, partner_token, partner_sid)
  local httpc = http:new()
  -- step 1: validate the token
  local res, err = httpc:request_uri(conf.validation_endpoint, {
    method = "POST",
    ssl_verify = false,
    headers = {
      ["Content-Type"] = "application/json"
    },
    body = '{"token":"' .. access_token .. '","path":"' .. path .. '","partnerToken":"' .. partner_token .. '","sid":"' .. partner_sid .. '","storeId":"' .. store_id .. '"}'
  })

  if not res then
    kong.log.err("failed to call introspection endpoint: ", err)
    return kong.response.exit(500)
  end
  if res.status ~= 200 then
    kong.log.err("introspection endpoint responded with status: ", res.status)
    return kong.response.exit(500)
  end

  -- iden = res.body
  local iden = cjson.decode(res.body)

  if iden.status ~= "allow" then
    kong.log.err("Custom authorizer reject this request.", iden.status)
    return kong.response.exit(401)
  end

  local out = iden.context

  return nil, out
end

function TokenHandler:access(conf)
  local access_token = ngx.req.get_headers()[conf.token_header] or ""
  local partner_token = ngx.req.get_headers()[conf.partner_token_header] or ""
  local partner_sid = ngx.req.get_headers()[conf.partner_sid_header] or ""
  local store_id = ngx.req.get_headers()[conf.storeid_header] or ""

  if not access_token and not partner_token then
      kong.response.exit(401)  --unauthorized
  end
  -- replace Bearer prefix
  -- access_token = access_token:sub(8,-1) -- drop "Bearer "
  local request_path = ngx.var.request_uri
  -- local values = utils.split(request_path, "/")
  -- kong.log("PATHS", values)
  -- local customer_id = values[3]

  local err, iden = introspect_access_token(conf, request_path, access_token, store_id, partner_token, partner_sid)

  -- Define outlet
  -- kong.log("OK", cjson.encode(iden))
  if iden.type then
    kong.service.request.set_header('x-type', iden.type)
  end
  if iden.role then
    kong.service.request.set_header('x-role', iden.role)
  end
  if iden.uid then
    kong.service.request.set_header('x-uid', iden.uid)
  end
  if iden.partnerKey then
    kong.service.request.set_header('x-partner-key', iden.partnerKey)
  end
  if iden.sid then
    kong.service.request.set_header('x-partner-sid', iden.sid)
  end
  if iden.customerIdentifier then
    kong.service.request.set_header('customerIdentifier', iden.customerIdentifier)
  end
end


return TokenHandler