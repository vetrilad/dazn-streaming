resource "aws_dynamodb_table" "video_streaming" {
  name           = "VideoStreams"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "userid"
  range_key      = "streamId"
  stream_enabled = true
  stream_view_type = "NEW_IMAGE"
  
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
