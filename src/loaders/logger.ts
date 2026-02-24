import winston from "winston";

const customFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      const {
        //errorLabelSet,
        //errorResponse,
        //index,
        //keyPattern,
        //keyValue,
        //code,
        ...cleanMeta
      } = meta;

      if (Object.keys(cleanMeta).length > 0) {
        log += `\n${JSON.stringify(cleanMeta, null, 2)}`;
      }
    }

    return log;
  },
);

export default () => {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      customFormat,
    ),
    transports: [new winston.transports.Console()],
  });
  return logger;
};
