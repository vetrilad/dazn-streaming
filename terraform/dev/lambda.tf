resource "aws_lambda_function" "stream_processing" {
  filename         = "lambda_function_payload.zip"
  function_name    = "video_stream_processor"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "exports.handler"
  source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
  runtime          = "nodejs8.10"
}

# resource "aws_lambda_event_source_mapping" "example" {
#   event_source_arn  = "${aws_dynamodb_table.example.stream_arn}"
#   function_name     = "${aws_lambda_function.example.arn}"
#   starting_position = "LATEST"
# }
