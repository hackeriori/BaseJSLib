export default function setVersion() {
  if (!window.top.versionInfo)
    window.top.versionInfo = {};
  window.top.versionInfo[process.env.projName!] = process.env.version!;
}