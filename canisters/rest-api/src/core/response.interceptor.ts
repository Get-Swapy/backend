import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        data: data,
      })),
    );
  }

  private convertBigIntToNumber(obj: any): any {
    if (typeof obj === 'bigint') {
      // TODO: Validate if precision loss is acceptable
      return Number(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertBigIntToNumber(item));
    }

    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          this.convertBigIntToNumber(value),
        ]),
      );
    }

    return obj;
  }
}
