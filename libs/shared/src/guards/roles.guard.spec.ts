// import { ForbiddenException } from '@nestjs/common';
// import { RolesGuard } from './roles.guard';
// import { Role } from '../enums/role.enum';
// import {
//   createMockReflector,
//   createMockExecutionContext,
//   createMockUserContext,
// } from '../../test/mocks';
// import { Reflector } from '@nestjs/core';
// import { Test, TestingModule } from '@nestjs/testing';

// describe('RolesGuard', () => {
//   let guard: RolesGuard;
//   let reflector: ReturnType<typeof createMockReflector>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         RolesGuard,
//         {
//           provide: Reflector,
//           useValue: createMockReflector(),
//         },
//       ],
//     }).compile();

//     guard = module.get<RolesGuard>(RolesGuard);
//     reflector = module.get(Reflector);
//   });

//   it('should allow access when no roles are required', () => {
//     reflector.getAllAndOverride.mockImplementation((arg) => {
//       if (arg === 'roles') {
//         return undefined;
//       }
//     });

//     const context = createMockExecutionContext({
//       user: createMockUserContext(),
//     });

//     expect(guard.canActivate(context)).toBe(true);
//   });

//   it('should allow access when empty roles array', () => {
//     reflector.getAllAndOverride.mockImplementation((arg) => {
//       if (arg === 'roles') {
//         return [];
//       }
//     });
//     const context = createMockExecutionContext({
//       user: createMockUserContext(),
//     });

//     expect(guard.canActivate(context)).toBe(true);
//   });

//   it('should allow access when user has required role', () => {
//     reflector.getAllAndOverride.mockImplementation((arg) => {
//       if (arg === 'roles') {
//         return [Role.admin];
//       }
//     });
//     const context = createMockExecutionContext({
//       user: createMockUserContext({ roles: [Role.admin] }),
//     });

//     expect(guard.canActivate(context)).toBe(true);
//   });

//   it('should throw ForbiddenException when user lacks required role', () => {
//     reflector.getAllAndOverride.mockImplementation((arg) => {
//       if (arg === 'roles') {
//         return [Role.admin];
//       }
//     });
//     const context = createMockExecutionContext({
//       user: createMockUserContext({ roles: [Role.worker] }),
//     });

//     expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
//   });

//   it('should throw ForbiddenException when no user context', () => {
//     reflector.getAllAndOverride.mockImplementation((arg) => {
//       if (arg === 'roles') {
//         return [Role.admin];
//       }
//     });
//     const context = createMockExecutionContext({});

//     expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
//   });
// });
