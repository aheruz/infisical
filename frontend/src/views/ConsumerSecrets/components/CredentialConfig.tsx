import * as yup from "yup";

export const credentialConfig = {
  weblogin: {
    title: "Web Login",
    description: "Configuration for web login credentials",
    schema: yup.object({
      title: yup.string().max(255).required().label("Title"),
      type: yup.string().default("weblogin").label("Type"),
      comment: yup.string().max(1000).label("Comment"),
      username: yup.string().max(255).required().label("Username"),
      password: yup.string().max(255).required().label("Password")
    }),
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "username", label: "Username", type: "text" },
      { name: "password", label: "Password", type: "password" },
      { name: "comment", label: "Comment", type: "text" },
    ]
  },
  creditcard: {
    title: "Credit Card",
    description: "Configuration for credit card information",
    schema: yup.object({
      title: yup.string().max(255).required().label("Title"),
      type: yup.string().default("creditcard").label("Type"),
      comment: yup.string().max(1000).label("Comment"),
      cardNumber: yup.string().max(16).required().label("Card Number"),
      expiryDate: yup.string().required().label("Expiry Date"),
      cvv: yup.string().max(4).required().label("CVV")
    }),
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "cardNumber", label: "Card Number", type: "text" },
      { name: "expiryDate", label: "Expiry Date", type: "text" },
      { name: "cvv", label: "CVV", type: "password" },
      { name: "comment", label: "Comment", type: "text" },
    ]
  },
  securenote: {
    title: "Secure Note",
    description: "Configuration for secure notes",
    schema: yup.object({
      title: yup.string().max(255).required().label("Title"),
      type: yup.string().default("securenote").label("Type"),
      comment: yup.string().max(1000).label("Comment"),
      note: yup.string().max(10000).required().label("Note")
    }),
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "note", label: "Note", type: "textarea" },
      { name: "comment", label: "Comment", type: "text" },
    ]
  }
};