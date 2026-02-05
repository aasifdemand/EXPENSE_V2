import { Injectable } from "@nestjs/common";



@Injectable()
export class DateUtil {
    parseExpenseDate(date: string): Date {
        const [year, month, day] = date.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
}