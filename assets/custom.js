var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "${{amount}}";
Shopify.formatMoney = function (cents, format) {
  if (typeof cents == 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
    return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.'),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
      cents = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

$(document).ready(function () {
  const modal = document.getElementById("modal");
  const triggers = document.querySelectorAll(".looks-wrapper .image-with-text__media-item.modal-trigger");
  const close = document.querySelector('#modal .close');

  const productHtml =
    '      <div class="modal-product">' +
    '            <a href="/products/~url~" class="modal-product_image">' +
    '              <img src="~featured_image~" alt="~featured_image.alt~">' +
    '            </a>' +
    '' +
    '            <div class="modal-product_info">' +
    '              <div class="modal-product_heading">' +
    '                <a href="/products/~url~" class="product-title">~title~</a>' +
    '                <div class="product_price">' +
    '                  <div class="price">~price~</div>' +
    '                  <div class="price--on-sale">~compare_at_price~</div>' +
    '                </div>' +
    '              </div>' +
    '              <div class="modal-product_description">~product.description~</div>' +
    '              <div class="modal-product_form">' +
    '                 <select class="variant-select_Product~product.id~ select" name="variant"></select>' +
    '                 <button' +
    '                      id="modalSubmitButton"' +
    '                      type="submit"' +
    '                      name="add"' +
    '                      class="product-form__submit button button--full-width button--primary"' +
    '                      disabled>' +
    '                      <span>' +
    '                        ~add-to-cart~' +
    '                        </span>' +
    '                 </button>     ' +
    '               </div>' +
    '            </div>' +
    '          </div>'

  let replaceInfo = (html, product) => {
    return html
      .replace(/~featured_image~/g, product.featured_image)
      .replace(/~featured_image.alt~/g, product.featured_image.alt)
      .replace(/~url~/g, product.handle)
      .replace(/~title~/g, product.title)
      .replace(/~price~/g, Shopify.formatMoney(product.price, '${{amount}}'))
      .replace(/~compare_at_price~/g,
        (product.price !== product.compare_at_price)
          ? Shopify.formatMoney(product.compare_at_price, '${{amount}}')
          : '')
      .replace(/~product.description~/g, product.description)
      .replace(/~product.id~/g, product.id)
      .replace(/disabled/g, product.available ? '' : 'disabled')
      .replace(/~add-to-cart~/g, product.available ? 'ADD TO CART' : 'SOLD OUT')
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', function () {

      modal.querySelector('.modal-image').innerHTML = trigger.querySelector('.image-with-text__media').outerHTML

      if (trigger.getAttribute('data-order') === '1') {
        firstProducts.forEach(product => {
          modal.querySelector('.modal-products').insertAdjacentHTML('beforeend', replaceInfo(productHtml, product))
          product.variants.forEach(variant => {
            modal.querySelector('.variant-select_Product' + product.id).insertAdjacentHTML('beforeend',
              '<option value="' + variant.id + '">' + variant.title + '</option>')
          })
        })
      } else if (trigger.getAttribute('data-order') === '2') {
        secondProducts.forEach(product => {
          modal.querySelector('.modal-products').insertAdjacentHTML('beforeend', replaceInfo(productHtml, product))
          product.variants.forEach(variant => {
            modal.querySelector('.variant-select_Product' + product.id).insertAdjacentHTML('beforeend',
              '<option value="' + variant.id + '">' + variant.title + '</option>')
          })
        })
      } else if (trigger.getAttribute('data-order') === '3') {
        thirdProducts.forEach(product => {
          modal.querySelector('.modal-products').insertAdjacentHTML('beforeend', replaceInfo(productHtml, product))
          product.variants.forEach(variant => {
            modal.querySelector('.variant-select_Product' + product.id).insertAdjacentHTML('beforeend',
              '<option value="' + variant.id + '">' + variant.title + '</option>')
          })
        })
      }

      modal.style.display = "block";

      document.querySelectorAll('#modalSubmitButton').forEach(btt =>{
        btt.addEventListener('click', function (){
          let selectedVariant = this.closest('.modal-product_form').querySelector('select').value

          let data = {
            "id": selectedVariant,
            "quantity": 1
          }

          jQuery.ajax({
            type: 'POST',
            url: '/cart/add.js',
            data: data,
            dataType: 'json',
            success: function() {
              modal.style.display = "none";
              window.location = window.routes.cart_url;
            }
          });
        })
      })
    })
  })

  close.addEventListener('click', function () {
    modal.style.display = "none";
    modal.querySelector('.modal-products').innerHTML = ''
  })

  window.addEventListener('click', function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      modal.querySelector('.modal-products').innerHTML = ''
    }
  })

})