import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface MurzApiGatewayProps {
    courseMicroservice: IFunction,
    cartMicroservice: IFunction,
    orderMicroservice: IFunction
}

export class MurzApiGateway extends Construct {
    constructor(scope: Construct, id: string, props: MurzApiGatewayProps) {
        super(scope, id);

        this.courseApiGateway(props.courseMicroservice)
        this.cartApiGateway(props.cartMicroservice)
        this.orderApiGateway(props.orderMicroservice)
    }

    private courseApiGateway(courseMicroservice: IFunction) {
        const api_gateway = new LambdaRestApi(this, 'EkamurzCourseApi', {
            restApiName: 'Murz Course APIs',
            handler: courseMicroservice,
            proxy: false
        });

        const course = api_gateway.root.addResource('course');
        course.addMethod('GET'); // GET /course
        course.addMethod('POST');  // POST /course

        const courseWithId = course.addResource('{id}'); // product/{id}
        courseWithId.addMethod('GET'); // GET /course/{id}
        courseWithId.addMethod('PUT'); // PUT /course/{id}
        courseWithId.addMethod('DELETE'); // DELETE /course/{id}
    }

    private cartApiGateway(cartMicroservice: IFunction) {
        const api_gateway = new LambdaRestApi(this, 'EkamurzCartApi', {
            restApiName: 'Murz Cart APIs',
            handler: cartMicroservice,
            proxy: false
        });

        const cart = api_gateway.root.addResource('cart');
        cart.addMethod('GET');  // GET /cart
        cart.addMethod('POST');  // POST /cart

        const cartWithId = cart.addResource('{username}');
        cartWithId.addMethod('GET');  // GET /cart/{username}
        cartWithId.addMethod('DELETE'); // DELETE /cart/{username}

        const cartCheckout = cart.addResource('checkout');
        cartCheckout.addMethod('POST'); // POST /cart/checkout
    }

    private orderApiGateway(orderMicroservice: IFunction) {
        const api_gateway = new LambdaRestApi(this, 'EkamurzOrderApi', {
            restApiName: 'Murz Order APIs',
            handler: orderMicroservice,
            proxy: false
        });

        const order = api_gateway.root.addResource('order');
        order.addMethod('GET');  // GET /order

        const oderWithId = order.addResource('{username}');
        oderWithId.addMethod('GET');  // GET /order/{username}
        // expected request : xxx/order/alvian?orderDate=timestamp

        return oderWithId;
    }
}