resource "aws_api_gateway_rest_api" "example" {
  name        = "ServerlessExample"
  description = "Terraform Serverless Application Example"
}

resource "aws_api_gateway_resource" "streaming" {
  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  parent_id   = "${aws_api_gateway_rest_api.example.root_resource_id}"
  path_part   = "streaming"
}

resource "aws_api_gateway_method" "put_streaming" {
  rest_api_id   = "${aws_api_gateway_rest_api.example.id}"
  resource_id   = "${aws_api_gateway_resource.streaming.id}"
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "get_streaming" {
  rest_api_id   = "${aws_api_gateway_rest_api.example.id}"
  resource_id   = "${aws_api_gateway_resource.streaming.id}"
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_deployment" "test" {
  depends_on = [
    "aws_api_gateway_integration.get_lambda",
    "aws_api_gateway_integration.put_lambda",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.example.id}"
  stage_name  = "test"
}

output "api_url"{
  value = "${aws_api_gateway_deployment.test.invoke_url}"
}
