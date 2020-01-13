/*!
 * @modern-dev/mtproto - a JavaScript client for the telegram MTProto protocol
 * https://github.com/modern-dev/mtproto
 *
 * Copyright (c) 2020 Bohdan Shtepan
 * Licensed under the MIT license.
 */

import { setItem, getItem, removeItem, clear, set, get, remove, getStorage } from './storage';
import { expect } from 'chai';
import 'mocha';

describe('core/storage.ts', () => {
  afterEach(async () => {
    await clear();
  });

  describe('storage basic operations', () => {
    it('setItem()/getItem() should work properly', async () => {
      // numbers
      const expectedValue1 = 123456;
      await setItem('foo1', expectedValue1);
      let actualValue = await getItem('foo1');

      expect(actualValue).not.to.be.null;
      expect(actualValue).to.be.equals(expectedValue1);

      // strings
      const expectedValue2 = 'foo bar';
      await setItem('foo2', expectedValue2);
      actualValue = await getItem('foo2');

      expect(actualValue).to.be.equals(expectedValue2);

      // booleans
      const expectedValue3 = true;
      await setItem('foo3', expectedValue3);
      actualValue = await getItem('foo3');

      expect(actualValue).to.be.equals(expectedValue3);
    });

    it('remove() should work properly', async () => {
      const expectedValue = 'baz';
      await setItem('bar', expectedValue);

      let barValue = await getItem('bar');

      expect(barValue).to.be.equals(expectedValue);

      await removeItem('bar');

      barValue = await getItem('bar');

      expect(barValue).to.be.null;
    });

    it('clear() should work properly', async() => {
      const expectedValue = 123456;

      await setItem('foo', expectedValue);

      let actualValue = await getItem('foo');

      expect(actualValue).to.be.equals(expectedValue);

      await clear();

      actualValue = await getItem('foo');

      expect(actualValue).to.be.null;
    });
  });

  describe('storage extra operations', () => {
    it('set()/get() should work properly', async () => {
      const expectedValue: { [key: string]: any } = {
        foo1: 123456,
        foo2: 'bar baz',
        foo3: true
      };

      await set(expectedValue);

      const actualVals = await get(...Object.keys(expectedValue));

      expect(actualVals).to.be.an('array').that.has.lengthOf(3);
      Object.keys(expectedValue).forEach((i, key) => {
        expect(actualVals[key]).to.be.equals(expectedValue[i]);
      });
    });

    it('remove() should work properly', async () => {
      const expectedValue: { [key: string]: any } = {
        foo1: 123456,
        foo2: 'bar baz',
        foo3: true
      };
      const keys = Object.keys(expectedValue);

      await set(expectedValue);

      expect(await get(...keys)).to.be.an('array')
        .that.has.lengthOf(3)
        .and.is.not.empty;

      await remove(...keys);

      expect(await get(...keys)).to.be.an('array')
        .that.has.lengthOf(3)
        .and.to.have.ordered.members([null, null, null]);
    });
  });

  describe('KVStorage', () => {
    it('should store the values with prefixed keys', async () => {
      const prefix = 'storage1';
      const storage = getStorage(prefix);
      const expectedValue = 123456;

      await storage.setItem('foo', expectedValue);

      expect(await getItem('foo')).to.be.null;
      expect(await storage.getItem('foo')).to.be.equals(expectedValue);
      expect(await getItem(`${prefix}foo`)).to.be.equals(expectedValue);
      expect(storage.length).to.be.equals(1);
    });

    it('different instances of KVStorage should not intersect in their key-value storage', async () => {
      const prefix1 = 'storage1';
      const prefix2 = 'storage2';
      const storage1 = getStorage(prefix1);
      const storage2 = getStorage(prefix2);
      const expectedValue1 = 'foo bar';
      const expectedValue2 = true;

      await storage1.setItem('foo', expectedValue1);
      await storage2.setItem('foo', expectedValue2);

      expect(await storage1.getItem('foo')).to.be.equals(expectedValue1);
      expect(await storage2.getItem('foo')).to.be.equals(expectedValue2);
      expect(await getItem('foo')).to.be.null;
      expect(await getItem(`${prefix1}foo`)).to.be.equals(expectedValue1);
      expect(await getItem(`${prefix2}foo`)).to.be.equals(expectedValue2);
    });
  });
});
