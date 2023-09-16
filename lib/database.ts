import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class MurzDatabase extends Construct {

    public readonly courseTable: ITable;
    public readonly cartTable: ITable;
    public readonly orderTable: ITable;

    constructor(scope: Construct, id: string){
        super(scope, id);

        this.courseTable = this.createCourseTable()
        this.cartTable = this.createCartTable()
        this.orderTable = this.createOrderTable()
    }

    private createCourseTable() : ITable {
        const courseTable = new Table(this, 'EkamurzCourseTable', {
            partitionKey: {
              name: 'id',
              type: AttributeType.STRING
            },
            tableName: 'ekamurz_courses',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
        });

        return courseTable;
    }

    private createCartTable() : ITable {
        const cartTable = new Table(this, 'EkamurzCartTable', {
            partitionKey: {
                name: 'username',
                type: AttributeType.STRING
            },
            tableName: 'ekamurz_carts',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
        });

        return cartTable;
    }

    private createOrderTable() : ITable {
        const orderTable = new Table(this, 'EkamurzOrderTable', {
            partitionKey: {
                name: 'username',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'orderDate',
                type: AttributeType.STRING
            },
            tableName: 'ekamurz_orders',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
        });

        return orderTable;
    }
}