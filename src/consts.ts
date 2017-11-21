
export default {
  localPath: process.env.STUDIO_YAML_DIR || "./replicated",
  upstreamEndpoint: process.env.STUDIO_UPSTREAM_BASE_URL || "https://api.replicated.com/market/",
  lintThreshold: process.env.STUDIO_LINT_THRESHOLD || "error",
  lintRequired: /^(?:y|yes|true|1)$/i.test(process.env.STUDIO_LINT_REQUIRED || ""),
};
