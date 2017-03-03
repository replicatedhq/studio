
// getAppMetadata must be included here and not proxied because the upstream api
// will throw an error when presented with a sequence that doesn't exist. this
// response is simply a static response, returned to keep replicated happy.

export default async function (req) {
  const metadata = {
    logo_data: "",
    version: "local",
    release_notes: "release notes go here",
    custom_branding: "",
  };

  return {
    status: 200,
    body: JSON.stringify(metadata),
  };
}
