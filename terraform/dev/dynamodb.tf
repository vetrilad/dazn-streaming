resource "aws_dynamodb_table" "video_streaming" {
  name           = "VideoStreams"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "userid"
  range_key      = "streamId"

  attribute {
    name = "userid"
    type = "S"
  }

  attribute {
    name = "streamId"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
