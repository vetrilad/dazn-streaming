resource "aws_lambda_function" "get_stream" {
  filename         = "../bin/get_lambda.zip"
  function_name    = "getStreamingSession"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "get-session.handler"
  source_code_hash = "${base64sha256(file("../bin/get_lambda.zip"))}"
  runtime          = "nodejs8.10"
}

resource "aws_api_gateway_integration" "get_lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  resource_id = "${aws_api_gateway_method.get_streaming.resource_id}"
  http_method = "${aws_api_gateway_method.get_streaming.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.get_stream.invoke_arn}"
}

resource "aws_lambda_permission" "apigw_get_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.get_stream.arn}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "${aws_api_gateway_rest_api.example.execution_arn}/*/*/*"
}
