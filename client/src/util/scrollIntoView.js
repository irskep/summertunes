export default function scrollIntoView(element, container=null){

  container = container || element.parentElement;

  const minY = container.scrollTop;
  const maxY = container.scrollTop + container.clientHeight;

  if (element.offsetTop + element.clientHeight < minY) {
    container.scrollTop = element.offsetTop;
  } else if (element.offsetTop > maxY) {
    container.scrollTop = element.offsetTop + container.clientHeight - element.clientHeight;
  }
}