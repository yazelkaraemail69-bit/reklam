from sqlalchemy.orm import Session

from app import models

PANEL_MODE = "panel"
SHOWCASE_MODE = "showcase"
SITE_MODE_KEY = "site_mode"


def get_site_mode(db: Session) -> str:
    setting = db.get(models.SiteSetting, SITE_MODE_KEY)
    return setting.value if setting else PANEL_MODE


def set_site_mode(db: Session, mode: str) -> str:
    if mode not in {PANEL_MODE, SHOWCASE_MODE}:
        raise ValueError("Unsupported site mode")

    setting = db.get(models.SiteSetting, SITE_MODE_KEY)
    if setting is None:
        setting = models.SiteSetting(key=SITE_MODE_KEY, value=mode)
    else:
        setting.value = mode

    db.add(setting)
    db.commit()
    return mode
