// Test webhook for "order is built" button
const webhookUrl = 'https://hook.us2.make.com/ateli5u3xhf0t4sjtpkjjmllvkmrd8pa';

const testPayload = {
  buttonName: "order is built",
  timestamp: new Date().toISOString(),
  notionPageId: "test-page-12345",
  notionPageUrl: "https://notion.so/test-page-12345",
  properties: {
    "Order Number": {
      type: "title",
      title: [{ plain_text: "ORD-2024-001" }]
    },
    "Customer Name": {
      type: "rich_text",
      rich_text: [{ plain_text: "John Doe" }]
    },
    "Status": {
      type: "status",
      status: {
        name: "In Progress",
        color: "blue"
      }
    },
    "Order Date": {
      type: "date",
      date: {
        start: "2024-01-15"
      }
    },
    "Total Amount": {
      type: "number",
      number: 1250.00
    },
    "Email": {
      type: "email",
      email: "john.doe@example.com"
    },
    "Phone": {
      type: "phone_number",
      phone_number: "+1-555-123-4567"
    },
    "Notes": {
      type: "rich_text",
      rich_text: [{ plain_text: "Rush order - needs expedited shipping" }]
    }
  },
  rawData: {
    id: "test-page-12345",
    url: "https://notion.so/test-page-12345",
    created_time: "2024-01-15T10:00:00.000Z",
    last_edited_time: "2024-01-15T14:30:00.000Z",
    properties: {
      // Same as above
      "Order Number": {
        type: "title",
        title: [{ plain_text: "ORD-2024-001" }]
      },
      "Customer Name": {
        type: "rich_text",
        rich_text: [{ plain_text: "John Doe" }]
      },
      "Status": {
        type: "status",
        status: {
          name: "In Progress",
          color: "blue"
        }
      },
      "Order Date": {
        type: "date",
        date: {
          start: "2024-01-15"
        }
      },
      "Total Amount": {
        type: "number",
        number: 1250.00
      },
      "Email": {
        type: "email",
        email: "john.doe@example.com"
      },
      "Phone": {
        type: "phone_number",
        phone_number: "+1-555-123-4567"
      },
      "Notes": {
        type: "rich_text",
        rich_text: [{ plain_text: "Rush order - needs expedited shipping" }]
      }
    }
  }
};

console.log('Sending test webhook to:', webhookUrl);
console.log('Payload:', JSON.stringify(testPayload, null, 2));

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('Response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response data:', data);
  console.log('✅ Webhook sent successfully!');
})
.catch(error => {
  console.error('❌ Error sending webhook:', error);
});