resource "aws_lambda_function" "check_stream" {
  filename         = "../bin/check_lambda.zip"
  function_name    = "checkNewStreaming"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "check-session.handler"
  source_code_hash = "${base64sha256(file("../bin/check_lambda.zip"))}"
  runtime          = "nodejs8.10"
}

resource "aws_lambda_event_source_mapping" "check_new_stream" {
  event_source_arn  = "${aws_dynamodb_table.video_streaming.stream_arn}"
  function_name     = "${aws_lambda_function.check_stream.arn}"
  starting_position = "LATEST"
}
