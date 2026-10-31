# Shared helper for hook/guardrail scripts. Source it with: . "<path>/json.sh"
#
# Claude Code passes the hook payload as JSON on stdin. Node is used to parse it
# (guaranteed in this project) so jq is not a requirement for teammates.
#
# Usage: INPUT=$(cat); CMD=$(json_field "$INPUT" tool_input.command)
# Prints the value at a dot-separated path; objects/arrays are printed as JSON,
# missing values print nothing.
json_field() {
  printf '%s' "$1" | node -e '
let s = "";
process.stdin.on("data", (d) => (s += d)).on("end", () => {
  let v;
  try { v = JSON.parse(s); } catch { return; }
  for (const k of process.argv[1].split(".")) v = v == null ? undefined : v[k];
  if (v != null) process.stdout.write(typeof v === "string" ? v : JSON.stringify(v));
});' "$2"
}
