import { createApp } from './app';
import { log } from './logger';

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`);
});
