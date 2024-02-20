import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { WebTracerProvider, NoopSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new NoopSpanProcessor());
provider.register({
    contextManager: new ZoneContextManager(),
});

registerInstrumentations({
    instrumentations: [
        getWebAutoInstrumentations({
            '@opentelemetry/instrumentation-document-load': {},
            '@opentelemetry/instrumentation-user-interaction': {},
            '@opentelemetry/instrumentation-fetch': {},
            '@opentelemetry/instrumentation-xml-http-request': {},
        }),
    ],
});
