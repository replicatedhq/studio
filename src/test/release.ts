import {describe, it} from "mocha";
import {expect} from "chai";
import {fillOutDoc, fillOutYamlString, kind, metadata} from "../replicated/release";

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

describe("fillOutYamlString", () => {
  it("finds the replicated yaml and preserves metadata", () => {
    const yml = `---
# kind: replicated
replicated_api_version: 2.18.0

---
# kind: scheduler-kubernetes
apiVersion: apps/v1
kind: Deployment
`;
    const [replYml, multiYml] = fillOutYamlString(yml);

    expect(replYml).to.equal("replicated_api_version: 2.18.0\n");
    expect(multiYml).to.equal(`---
# kind: replicated
replicated_api_version: 2.18.0
---
# kind: scheduler-kubernetes
apiVersion: apps/v1
kind: Deployment
`);
  });
});

describe("metadata", () => {
  it("finds metadata", () => {
    const yaml = `

# id: abc
# kind: replicated

replicated_api_version: 2.18.0`;
    const answer = `# id: abc
# kind: replicated`;
    const output = metadata(yaml);

    expect(output).to.equal(answer);
  });
});

describe("kind", () => {
  it("finds the kind", () => {
    const meta = `# id: abc
# kind: replicated`;
    const answer = "replicated";
    const output = kind(meta);

    expect(output).to.equal(answer);
  });
});
