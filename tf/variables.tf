variable "vercel_api_token" {
  type = string
}

variable "digital_ocean_token" {
  type = string
}

variable "heroku_api_key" {
  type = string
}

variable "vercel_team" {
  type    = string
  default = "quantified-uncertainty"
}

variable "metaforecast_env" {
  type = map(string)
}
