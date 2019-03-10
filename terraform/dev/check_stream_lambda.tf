# resource "aws_lambda_function" "check_stream" {
#   filename         = "../bin/put_lambda.zip"
#   function_name    = "video_stream_processor"
#   role             = "${aws_iam_role.iam_for_lambda.arn}"
#   handler          = "handler"
#   source_code_hash = "${base64sha256(file("lambda_function_payload.zip"))}"
#   runtime          = "nodejs8.10"
# }
#
# resource "aws_api_gateway_resource" "proxy" {
#   rest_api_id = "${aws_api_gateway_rest_api.example.id}"
#   parent_id   = "${aws_api_gateway_rest_api.example.root_resource_id}"
#   path_part   = "{proxy+}"
# }
#
# resource "aws_api_gateway_method" "proxy" {
#   rest_api_id   = "${aws_api_gateway_rest_api.example.id}"
#   resource_id   = "${aws_api_gateway_resource.proxy.id}"
#   http_method   = "ANY"
#   authorization = "NONE"
# }
#
# resource "aws_api_gateway_integration" "lambda" {
#   rest_api_id = "${aws_api_gateway_rest_api.example.id}"
#   resource_id = "${aws_api_gateway_method.proxy.resource_id}"
#   http_method = "${aws_api_gateway_method.proxy.http_method}"
#
#   integration_http_method = "POST"
#   type                    = "AWS_PROXY"
#   uri                     = "${aws_lambda_function.check_stream.invoke_arn}"
# }
#
# resource "aws_api_gateway_method" "proxy_root" {
#   rest_api_id   = "${aws_api_gateway_rest_api.example.id}"
#   resource_id   = "${aws_api_gateway_rest_api.example.root_resource_id}"
#   http_method   = "ANY"
#   authorization = "NONE"
# }
#
# resource "aws_api_gateway_integration" "lambda_root" {
#   rest_api_id = "${aws_api_gateway_rest_api.example.id}"
#   resource_id = "${aws_api_gateway_method.proxy_root.resource_id}"
#   http_method = "${aws_api_gateway_method.proxy_root.http_method}"
#
#   integration_http_method = "POST"
#   type                    = "AWS_PROXY"
#   uri                     = "${aws_lambda_function.check_stream.invoke_arn}"
# }
