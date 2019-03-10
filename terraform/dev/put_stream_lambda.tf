resource "aws_lambda_function" "put_stream" {
  filename         = "../bin/put_lambda.zip"
  function_name    = "putStreamingSession"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "put-session.handler"
  source_code_hash = "${base64sha256(file("../bin/put_lambda.zip"))}"
  runtime          = "nodejs8.10"
}

resource "aws_api_gateway_integration" "put_lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  resource_id = "${aws_api_gateway_method.put_streaming.resource_id}"
  http_method = "${aws_api_gateway_method.put_streaming.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.put_stream.invoke_arn}"
}

resource "aws_lambda_permission" "apigw_put_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.put_stream.arn}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "${aws_api_gateway_rest_api.example.execution_arn}/*/*/*"
}
