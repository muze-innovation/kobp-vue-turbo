local typedefs = require "kong.db.schema.typedefs" 
 
return {
  name = "custom-auth",
  fields = {
    { protocols = typedefs.protocols_http },
    { consumer = typedefs.no_consumer },
    { config = {
        type = "record",
        fields = {
          { token_header = typedefs.header_name { default = "x-api-token" }, },
          { partner_token_header = typedefs.header_name { default = "x-partner-token" }, },
          { partner_sid_header = typedefs.header_name { default = "x-partner-sid" }, },
          { storeid_header = typedefs.header_name { default = "x-storeid" }, },
          { validation_endpoint = { type = "string", required = true }, },
        },
      },
    },
  },
}