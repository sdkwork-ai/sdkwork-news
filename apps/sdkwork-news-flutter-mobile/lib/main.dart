import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

import 'app.dart';
import 'bootstrap/runtime.dart';
import 'bootstrap/sdkwork_tls_trust.dart';

Future<void> main() async {
  // The HTTPS trust layer must be installed before any HTTP client is
  // created, so it runs ahead of binding initialization and services.
  // Browsers own TLS trust and do not expose Platform.environment.
  if (!kIsWeb) {
    SdkworkTlsTrust.installForApp();
  }

  WidgetsFlutterBinding.ensureInitialized();
  try {
    final runtime = await bootstrapNewsRuntime();
    runApp(NewsApp(runtime: runtime));
  } catch (error) {
    runApp(const NewsBootstrapFailureApp());
  }
}
