import "dotenv/config";
import { URL } from "url";

const baseUrl = new URL(
  `${process.env.EXTERNAL_PROTOCOL ?? "http"}://${
    process.env.EXTERNAL_HOST ?? "localhost:3000"
  }`
);

export default baseUrl;
