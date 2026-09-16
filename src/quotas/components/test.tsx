import { wrapPage } from "../../../lib/page-wrapper";
import { Model, WithHub, Hub } from "./test-ctrl";

const Page: WithHub<Model> = ({ name }) => <div>Hello {name}</div>;

export const TestPage = wrapPage<Model>(Page, Hub);
