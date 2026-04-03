const items = document.querySelectorAll('.sidebar-item');
const blocks = document.querySelectorAll('.content-block');

// определяем есть ли hover (ПК)
const isHoverDevice = window.matchMedia('(hover: hover)').matches;

// универсальная функция активации
function activate(id) {
    // sidebar
    items.forEach(item => {
        item.classList.toggle('active', item.dataset.id === id);
    });

    // контент
    blocks.forEach(block => {
        block.classList.toggle('active', block.dataset.id === id);
    });
}

// навешиваем события
items.forEach(item => {

    const id = item.dataset.id;

    // ПК → hover
    if (isHoverDevice) {
        item.addEventListener('mouseenter', () => activate(id));
    }

    // телефон → клик
    item.addEventListener('click', () => {
        if (!isHoverDevice) {
            activate(id);
        }
    });

});