import {describe, it} from "mocha";
import {expect} from "chai";
import {fillOutDoc} from "../replicated/release";

describe("fillOutDoc", () => {
  it("handles an empty components spec", () => {
    fillOutDoc({});
  });
  it("populates value from static_val", () => {
    const updated = fillOutDoc({
      components: [
        {
          containers: [
            {
              env_vars: [
                {name: "PLATE", static_val: "kfbr392"},
              ],
            },
          ],
        },
      ],
    });

    expect(updated).to.have.deep.property("components.0.containers.0.env_vars.0.value", "kfbr392");
  });
  it("populates static_val from value", () => {
    const updated = fillOutDoc({
      components: [
        {
          containers: [
            {
              env_vars: [
                {name: "PLATE", value: "kfbr392"},
              ],
            },
          ],
        },
      ],
    });

    expect(updated).to.have.deep.property("components.0.containers.0.env_vars.0.static_val", "kfbr392");
  });
  it("adds logs if absent", () => {
    const updated = fillOutDoc({
      components: [
        {
          containers: [
            {
              name: "some-name",
            },
          ],
        },
      ],
    });

    expect(updated).to.have.deep.property("components.0.containers.0.logs.max_size", "");
    expect(updated).to.have.deep.property("components.0.containers.0.logs.max_files", "");
  });
});
