import { FishPiPage } from './app.po';

describe('fish-pi App', () => {
  let page: FishPiPage;

  beforeEach(() => {
    page = new FishPiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
