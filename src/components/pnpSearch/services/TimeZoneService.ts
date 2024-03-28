export class TimeZoneService {
    public static converToLocalZone(utcDateString: string) {
        const date = new Date(utcDateString);
        const offset = date.getTimezoneOffset();
        date.setMinutes(date.getMinutes() - offset);

        return new Date(date.getTime())
    }
    public static convertToUTC(date: Date) {
        const offset = date.getTimezoneOffset();
        date.setMinutes(date.getMinutes() + offset);

        return new Date(date.getTime())
    }

    public static getThisWeekStartDate = () => {
        let today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay(), 0, 0, 0);

    }
    public static readonly now = new Date();
    public static readonly todayStartDate = TimeZoneService.convertToUTC(new Date(new Date().setHours(0, 0, 0, 0)));
    public static readonly todayEndDate = TimeZoneService.convertToUTC(new Date(new Date().setHours(23, 59, 59, 999)));
    public static readonly tomorrowStartDate = TimeZoneService.convertToUTC(new Date(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).setHours(0, 0, 0, 0)));
    public static readonly tomorrowEndDate = TimeZoneService.convertToUTC(new Date(new Date(new Date().getTime() + 1000 * 60 * 60 * 24).setHours(23, 59, 59, 999)));
    public static readonly thisWeekStartDate = new Date(TimeZoneService.now.getFullYear(), TimeZoneService.now.getMonth(), TimeZoneService.now.getDate() - TimeZoneService.now.getDay(), 0, 0, 0);
    public static readonly thisWeekEndDate = new Date(TimeZoneService.now.getFullYear(), TimeZoneService.now.getMonth(), TimeZoneService.now.getDate() - TimeZoneService.now.getDay() + 7, 0, 0, 0);
    public static readonly nextWeekStartDate = TimeZoneService.convertToUTC(new Date(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * new Date().getDay()).setHours(0, 0, 0, 0)));
    public static readonly nextWeekEndDate = TimeZoneService.convertToUTC(new Date(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 2 * new Date().getDay()).setHours(23, 59, 59, 999)));
}