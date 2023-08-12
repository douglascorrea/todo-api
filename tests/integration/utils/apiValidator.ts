import { OpenAPISpecObject } from 'openapi-validator';
import jestOpenAPI from 'jest-openapi';
import swagger from '../../../swagger.json';

jestOpenAPI(swagger as OpenAPISpecObject);
