import { createSearchableDropdown } from './index';

test('createSearchableDropdown creates an input element', () => {
  document.body.innerHTML = '<div id="test-container"></div>';
  const container = document.getElementById('test-container');
  createSearchableDropdown({
    container,
    data: [{ id: 1, name: 'Test Option' }],
    placeholder: 'Test Placeholder',
    onSelect: () => {}
  });
  
  const input = container.querySelector('input');
  expect(input).not.toBeNull();
  expect(input.getAttribute('placeholder')).toBe('Test Placeholder');
});
