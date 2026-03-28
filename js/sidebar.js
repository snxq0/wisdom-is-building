const items = document.querySelectorAll('.sidebar-item');
const blocks = document.querySelectorAll('.content-block');

items.forEach(item => {
    item.addEventListener('mouseenter', () => {

        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const id = item.getAttribute('data-id');

        blocks.forEach(block => {
            block.classList.remove('active');
            if (block.getAttribute('data-id') === id) {
                block.classList.add('active');
            }
        });

    });
});