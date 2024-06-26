import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App, { editItemInDB } from './App';
import { capsFirst, getCurrentDT, addItemToDB, startDateChange, endDateChange } from './App';
import moment from 'moment';

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        { id: 1, name: 'Item 1', last_updated_dt: '2024-06-25 12:00:00' },
        { id: 2, name: 'Item 2', last_updated_dt: '2024-06-26 09:00:00' },
      ]),
    })
  );
});


test('renders App component', () => {
  render(<App />);
  const headerElement = screen.getByText(/Frontend Developer Assessment/i);
  expect(headerElement).toBeInTheDocument();
});

test('opens and closes modal correctly', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Add item'));
  expect(screen.getByText('Add new Item')).toBeInTheDocument();
  fireEvent.click(screen.getByText('X'));
});

test('fetches items and renders them correctly', async () => {
  const { findByText } = render(<App />);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith('/items', {"headers": {"Accept": "application/json", "Content-Type": "application/json"}, "method": "GET"});

  const item1 = await findByText('Item 1');
  const item2 = await findByText('Item 2');

  expect(item1).toBeInTheDocument();
  expect(item2).toBeInTheDocument();
});

test('Add item modal opens when "Add item" button is clicked', async () => {
  render(<App />);
  const addItemButton = screen.getByText(/Add item/i);
  fireEvent.click(addItemButton);
  const modalElement = await screen.findByText(/Add new Item/i);
  expect(modalElement).toBeInTheDocument();
});

test('Form inputs update correctly when user types', async () => {
  render(<App />);
  const addItemButton = screen.getByText(/Add item/i);
  fireEvent.click(addItemButton);

  const nameInput = screen.getByLabelText<HTMLInputElement>(/Name:/i);
  fireEvent.change(nameInput, { target: { value: 'Test Item' } });
  expect(nameInput.value).toBe('Test Item');

  const categoryInput = screen.getByLabelText<HTMLInputElement>(/Category:/i);
  fireEvent.change(categoryInput, { target: { value: 'Test Category' } });
  expect(categoryInput.value).toBe('Test Category');
});

test('capsFirst function', () => {
  const result = capsFirst("test")
  expect(result).toBe("Test")
})

test('capsFirst capitalizes the first letter', () => {
  expect(capsFirst('test')).toBe('Test');
  expect(capsFirst('apple')).toBe('Apple');
  expect(capsFirst('hello')).toBe('Hello');
});

test('getCurrentDT function', () => {
  const format = "YYYY-MM-DD HH:mm:ss";
  const date = new Date();
  const current = moment(date).format(format);
  const result = getCurrentDT()
  expect(result).toBe(current)
})

test('getCurrentDT returns current date and time', () => {
  const expectedFormat = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/; 
  expect(getCurrentDT()).toMatch(expectedFormat);
});

test("addItemToDB Function", (() => {
  const mockData = [
    { id: '1', name: 'Item 1', category: 'Category 1', price: '10.00', quantity: 5 },
    { id: '2', name: 'Item 2', category: 'Category 2', price: '15.00', quantity: 3 },
  ];

  const payload = {
    name: 'Test Item',
    category: 'Test Category',
    price: '20.00',
    quantity: 2,
  };

  const expectedBody = {
    id: '3', 
    name: 'Test Item',
    category: 'Test Category',
    price: '20.00',
    quantity: 2,
    last_updated_dt: getCurrentDT(), 
  };

  addItemToDB(mockData, payload);
}))

describe('endDateChange function', () => {
  test('should return a Date object with time set to 00:00:00.000 for valid dateString', () => {
    const dateString = '2024-06-26'; 
    const expectedDate = new Date(dateString);
    expectedDate.setHours(0, 0, 0, 0);

    const result = endDateChange(null, dateString);
    expect(result).toEqual(expectedDate);
  });

  test('should return null for empty dateString', () => {
    const dateString = '';
    const result = endDateChange(null, dateString);
    expect(result).toBeNull();
  });
});

describe('startDateChange function', () => {
  test('should return a Date object with time set to 00:00:00.000 for valid dateString', () => {
    const dateString = '2024-06-26'; 
    const expectedDate = new Date(dateString);
    expectedDate.setHours(0, 0, 0, 0);

    const result = startDateChange(null, dateString);
    expect(result).toEqual(expectedDate);
  });

  test('should return null for empty dateString', () => {
    const dateString = '';
    const result = startDateChange(null, dateString);
    expect(result).toBeNull();
  });
});

test("editItemInDb Function", (() => {
  const payload = {
    id: '3',
    name: 'Test Item',
    category: 'Test Category',
    price: '20.00',
    quantity: 2,
  };

  const expectedBody = {
    id: '3', 
    name: 'Test Item',
    category: 'Test Category',
    price: '20.00',
    quantity: 2,
    last_updated_dt: getCurrentDT(), 
  };

  editItemInDB(payload);
}))

