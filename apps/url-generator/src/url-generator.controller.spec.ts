import { Test, TestingModule } from '@nestjs/testing';
import { UrlGeneratorController } from './url-generator.controller';
import { UrlGeneratorService } from './url-generator.service';

describe('UrlGeneratorController', () => {
  let urlGeneratorController: UrlGeneratorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UrlGeneratorController],
      providers: [UrlGeneratorService],
    }).compile();

    urlGeneratorController = app.get<UrlGeneratorController>(UrlGeneratorController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(urlGeneratorController.getHello()).toBe('Hello World!');
    });
  });
});
