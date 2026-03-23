#!/usr/bin/env node

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const target = process.argv[2] || process.env.GRPC_TARGET || '127.0.0.1:5000';
const reflectionProtoPath = require.resolve(
  '@grpc/reflection/build/proto/grpc/reflection/v1/reflection.proto',
);

const packageDefinition = protoLoader.loadSync(reflectionProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const reflectionPackage = grpc.loadPackageDefinition(packageDefinition);
const ReflectionClient = reflectionPackage.grpc.reflection.v1.ServerReflection;
const client = new ReflectionClient(
  target,
  grpc.credentials.createInsecure(),
);
const stream = client.ServerReflectionInfo();
const timeout = setTimeout(() => {
  console.error(`Timed out connecting to ${target}`);
  process.exit(1);
}, 5000);

stream.on('data', (response) => {
  clearTimeout(timeout);

  const services =
    response.listServicesResponse?.service?.map(({ name }) => name) ?? [];

  console.log(
    JSON.stringify(
      {
        target,
        services,
      },
      null,
      2,
    ),
  );

  stream.end();
  client.close();
});

stream.on('error', (error) => {
  clearTimeout(timeout);
  console.error(error.message);
  process.exit(1);
});

stream.write({ host: '', listServices: '*' });
