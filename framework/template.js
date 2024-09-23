/** 
 * @param {string} name
 * @param {object} attrs
 * @param {Array<HTMLElement | String>} children
 */
export const createElement = (name, attrs = {}, children) => {
  const dom = document.createElement(name);

  setElAttributes(dom, attrs);

  if (children) {
    setElChildren(dom, children);
  }

  return dom;
}

/**
 * 
 * @param {HTMLElement} domEl 
 * @param {object} attrs 
 */
export const setElAttributes = (domEl, attrs) => {
  for (const [attr, value] of Object.entries(attrs)) {
    if (attr.startsWith('on')) {
      domEl.addEventListener(attr.substring(2), value);
    } else {
      domEl.setAttribute(attr, value);
    }
  }
}

/**
 * 
 * @param {HTMLElement} domEl 
 * @param {Array<HTMLElement | String>} children 
 */
export const setElChildren = (domEl, children) => {
  domEl.innerHTML = '';
  domEl.append(...children);
}