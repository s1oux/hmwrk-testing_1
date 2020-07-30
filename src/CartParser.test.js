import CartParser from './CartParser';
import jsonData from '../samples/cart.json';

let parser;

beforeEach(() => {
  parser = new CartParser();
});

describe('CartParser - unit tests', () => {
  describe('Calculation', () => {
    it('should return correctly calculated total sum', () => {
      const mockValues = [
        { price: 0.5, quantity: 2 },
        { price: 3, quantity: 3 },
        { price: 1, quantity: 4 },
        { price: 2, quantity: 5 },
      ];
      const calculatedTotal = parser.calcTotal(mockValues);
      expect(calculatedTotal).toEqual(24);
    });
  });

  describe('Parsing', () => {
    it('should throw an error if read file has incorrect format', () => {
      parser.readFile = jest.fn(
        () => `
				,Price,Quantity
				Mollis consequat,9.00,2
				,10.32,1
				Scelerisque lacinia,ohwait,1
				Consectetur adipiscing,28.72,
				Condimentum aliquet,13.90,1			
			`
      );
      expect(() => parser.parse('mock_path')).toThrowError(
        'Validation failed!'
      );
    });

    it('should correctly parse string line to the object (without generated id)', () => {
      const parsedObj = parser.parseLine('Scelerisque lacinia,18.90,1');
      const mockParsed = {
        name: 'Scelerisque lacinia',
        price: 18.9,
        quantity: 1,
      };
      expect(parsedObj).toHaveProperty('name', expect.any(String));
      expect(parsedObj).toHaveProperty('price', expect.any(Number));
      expect(parsedObj).toHaveProperty('quantity', expect.any(Number));
      expect(parsedObj).toMatchObject(mockParsed);
    });
  });

  describe('Validation', () => {
    it('correct format should pass the validation', () => {
      const validationErrors = parser.validate(`Product name,Price,Quantity
			Mollis consequat,9.00,2
			Tvoluptatem,10.32,1
			Scelerisque lacinia,18.90,1
			Consectetur adipiscing,28.72,10
			Condimentum aliquet,13.90,1`);

      expect(validationErrors).toHaveLength(0);
    });

    it('incorrect csv file format should break the validation', () => {
      const validationErrors = parser.validate(`Product name,rice,Quantity
			Mollis consequat,9.00,2
			Tvoluptatem,10.32,1
			Scelerisque lacinia,18.90,1
			Consectetur adipiscing,28.72,10
			Condimentum aliquet,13.90,1`);

      expect(validationErrors).toHaveLength(1);
    });

    it('incorrect header in csv file should return error object with header error description', () => {
      const validationErrors = parser.validate(`Product name,rice,Quantity
			Mollis consequat,9.00,2
			Tvoluptatem,10.32,1
			Scelerisque lacinia,18.90,1
			Consectetur adipiscing,28.72,10
			Condimentum aliquet,13.90,1`);

      const errorObject = {
        type: 'header',
        row: 0,
        column: 1,
        message: 'Expected header to be named "Price" but received rice.',
      };
      expect(validationErrors).toContainEqual(errorObject);
    });

    it('incorrect count of values in a row in csv file should return error object with row error description', () => {
      const validationErrors = parser.validate(`Product name,Price,Quantity
			Mollis consequat,9.00,2
			Tvoluptatem,10.32,1
			Scelerisque lacinia,18.90,1
			Consectetur adipiscing,28.72
			Condimentum aliquet,13.90,1`);

      const errorObject = {
        type: 'row',
        row: 4,
        column: -1,
        message: 'Expected row to have 3 cells but received 2.',
      };
      expect(validationErrors).toContainEqual(errorObject);
    });

    it('empty string in name cell in csv file should return error object with cell-string error description', () => {
      const validationErrors = parser.validate(`Product name,Price,Quantity
			,9.00,2
			Tvoluptatem,10.32,1
			Scelerisque lacinia,18.90,1
			Consectetur adipiscing,28.72,10
			Condimentum aliquet,13.90,1`);

      const errorObject = {
        type: 'cell',
        row: 1,
        column: 0,
        message: 'Expected cell to be a nonempty string but received "".',
      };
      expect(validationErrors).toContainEqual(errorObject);
    });

    it('empty string in name cell in csv file should return error object with cell-string error description', () => {
      const validationErrors = parser.validate(`Product name,Price,Quantity
			Mollis consequat,9.00,2
			Tvoluptatem,10.32,1
			Scelerisque lacinia,ohwait,1
			Consectetur adipiscing,28.72,10
			Condimentum aliquet,13.90,1`);

      const errorObject = {
        type: 'cell',
        row: 3,
        column: 1,
        message: 'Expected cell to be a positive number but received "ohwait".',
      };
      expect(validationErrors).toContainEqual(errorObject);
    });

    it('create error method should return proper error object', () => {
      const mockErrorObj = {
        type: 'error',
        row: 1,
        column: 1,
        message: 'typical error message',
      };
      const error = parser.createError('error', 1, 1, 'typical error message');

      expect(error).toHaveProperty('type', expect.any(String));
      expect(error).toHaveProperty('row', expect.any(Number));
      expect(error).toHaveProperty('column', expect.any(Number));
      expect(error).toHaveProperty('message', expect.any(String));
      expect(error).toEqual(mockErrorObj);
    });
  });
});

describe('CartParser - integration test', () => {
  it('parsed csv should return array of items and total sum as a number', () => {
    const parsedCSV = parser.parse('samples/cart.csv');

    expect(parsedCSV).toHaveProperty('items', expect.any(Array));
    expect(parsedCSV).toHaveProperty('total', expect.any(Number));
  });
});
