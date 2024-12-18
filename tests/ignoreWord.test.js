import {
    afterEach, beforeEach, expect, test,
  } from '@jest/globals';
  import {
    getPrompt, handleEvents, removePrompt, printHistories,
  } from '../app/index.js';
  import config from '../config/index.js';
  import {
    createEvents, TIMEOUT, MOCK_USER_01, MOCK_TEXT_OK,
  } from './utils.js';
  
  beforeEach(() => {
    //
  });
  
  afterEach(() => {
    removePrompt(MOCK_USER_01);
  });
  
  test('IGNORE_WORD', async () => {
    const events = [
      ...createEvents(['顯示下單與出貨方式']),
      ...createEvents(['嗨嗨']),
    ];
    let results;
    try {
      results = await handleEvents(events);
    } catch (err) {
      console.error(err);
    }
    if (config.APP_DEBUG) printHistories();
    const replies = results.map(({ messages }) => messages.map(({ text }) => text));
    if (config.IGNORE_WORD != null) {
      expect(replies).toEqual(
        [
          [MOCK_TEXT_OK],
        ],
      );
    } else {
      expect(replies).toEqual(
        [
          [MOCK_TEXT_OK],
          [MOCK_TEXT_OK],
        ],
      );
    }

  }, TIMEOUT);
  