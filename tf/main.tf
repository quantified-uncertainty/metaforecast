terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.1"
    }
  }
}

provider "vercel" {
  # Or omit this for the api_token to be read
  # from the VERCEL_API_TOKEN environment variable
  #   api_token = var.vercel_api_token
}

resource "vercel_project" "with_git" {
  name      = "metaforecast-test"
  team_id   = "quantified-uncertainty"
  framework = "nextjs"

  environment = [
    {
      key    = "NEXT_PUBLIC_ALGOLIA_APP_ID"
      value  = "96UD3NTQ7L"
      target = ["production"]
    }
  ]

  git_repository = {
    type = "github"
    repo = "berekuk/metaforecast"
  }
}
