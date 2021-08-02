export default function copyText(text: string) {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.setAttribute('value', text);
  input.select();
  if (document.execCommand) {
    document.execCommand('copy');
  }
  document.body.removeChild(input);
}