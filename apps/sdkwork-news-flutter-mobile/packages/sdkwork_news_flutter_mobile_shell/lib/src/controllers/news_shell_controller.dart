import 'package:flutter/foundation.dart';

enum NewsShellTab { news, assistant, store, account }

class NewsShellController extends ChangeNotifier {
  NewsShellTab activeTab = NewsShellTab.news;
  bool isSecondaryPage = false;

  void select(NewsShellTab tab) {
    if (activeTab == tab) {
      return;
    }
    activeTab = tab;
    // A primary tab always starts at its own root page. Secondary pages are
    // owned by the feature that opened them and must not leak across tabs.
    isSecondaryPage = false;
    notifyListeners();
  }

  void setSecondaryPage(bool value) {
    if (isSecondaryPage == value) {
      return;
    }
    isSecondaryPage = value;
    notifyListeners();
  }
}
