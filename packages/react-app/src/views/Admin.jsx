import { Form, Typography, Button, InputNumber } from "antd";

function Admin({ tx, writeContracts }) {
  const [form] = Form.useForm();

  const initialize = async v => {
    tx(writeContracts.IDStaking.createRound(v.start, v.duration, ""));
  };

  return (
    <>
      <div
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          maxWidth: "400px",
          margin: "60px auto 20px auto",
          border: "1px solid",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <Typography.Title level={4}>Create New Staking Round</Typography.Title>
        </div>
        <div>
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <Form
              form={form}
              style={{ margin: "0px auto", width: "100%", padding: "0px 10px" }}
              initialValues={{ duration: "60" }}
              name="initialize"
              layout="vertical"
              onFinish={initialize}
            >
              <Form.Item
                name="start"
                rules={[
                  {
                    required: true,
                    message: "Duration has to be a number > 0",
                  },
                ]}
                label="Start Timestamp"
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="duration"
                rules={[
                  {
                    required: true,
                    message: "Duration has to be a number > 0",
                  },
                ]}
                label="Duration (in seconds)"
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item>
                <Button style={{ marginRight: "10px" }} htmlType="submit">
                  Start
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
