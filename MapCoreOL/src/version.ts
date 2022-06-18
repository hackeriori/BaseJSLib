export default function setVersion() {
  if (!window.versionInfo)
    window.versionInfo = {};
  window.versionInfo[process.env.projName!] = process.env.version!;
}
