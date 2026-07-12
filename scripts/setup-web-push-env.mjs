import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import webPush from "web-push";

const envPath = new URL("../.env.local", import.meta.url);
const defaultVapidSubject = "https://github.com/ColdTbrew/family-gifticon-app";

function parseEnv(contents) {
  const values = new Map();

  for (const line of contents.split(/\r?\n/)) {
    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0 || line.trimStart().startsWith("#")) continue;
    values.set(line.slice(0, separatorIndex), line.slice(separatorIndex + 1));
  }

  return values;
}

function setEnvValue(contents, key, value) {
  const lines = contents.split(/\r?\n/);
  const lineIndex = lines.findIndex((line) => line.startsWith(`${key}=`));

  if (lineIndex >= 0) {
    lines[lineIndex] = `${key}=${value}`;
  } else {
    if (lines.at(-1) !== "") lines.push("");
    lines.push(`${key}=${value}`);
  }

  return lines.join("\n");
}

let contents = await readFile(envPath, "utf8").catch(() => "");
const existing = parseEnv(contents);
const hasPublicKey = Boolean(existing.get("NEXT_PUBLIC_VAPID_PUBLIC_KEY"));
const hasPrivateKey = Boolean(existing.get("VAPID_PRIVATE_KEY"));

if (hasPublicKey !== hasPrivateKey) {
  throw new Error("VAPID 공개키와 비공개키 중 하나만 설정돼 있습니다. 키 쌍을 확인해주세요.");
}

const configured = [];

if (!hasPublicKey) {
  const keys = webPush.generateVAPIDKeys();
  contents = setEnvValue(contents, "NEXT_PUBLIC_VAPID_PUBLIC_KEY", keys.publicKey);
  contents = setEnvValue(contents, "VAPID_PRIVATE_KEY", keys.privateKey);
  configured.push("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY");
}

if (!existing.get("CRON_SECRET")) {
  contents = setEnvValue(contents, "CRON_SECRET", randomBytes(32).toString("hex"));
  configured.push("CRON_SECRET");
}

if (!existing.get("VAPID_SUBJECT")) {
  contents = setEnvValue(contents, "VAPID_SUBJECT", defaultVapidSubject);
  configured.push("VAPID_SUBJECT");
}

await writeFile(envPath, contents.endsWith("\n") ? contents : `${contents}\n`, {
  encoding: "utf8",
  mode: 0o600
});

console.log(
  configured.length > 0
    ? `설정 완료: ${configured.join(", ")}`
    : "기존 웹 푸시 키와 cron secret을 유지했습니다."
);
