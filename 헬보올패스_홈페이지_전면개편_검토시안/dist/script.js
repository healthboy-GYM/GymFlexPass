const tierNames = {
  1: 'BLACK',
  2: 'SILVER',
  3: 'GOLD',
  4: 'PREMIUM',
  5: 'S-PREMIUM'
};

const tierRestrictions = {
  1: 'Black 외 상위 등급 지점은 이용이 제한됩니다.',
  2: 'Gold·Premium·S-Premium 지점은 이용이 제한됩니다.',
  3: 'Premium·S-Premium 지점은 이용이 제한됩니다.',
  4: 'S-Premium 지점은 이용이 제한됩니다.',
  5: '현재 공개된 등급 원칙상 전 등급 지점을 이용할 수 있습니다.'
};

const selected = new Map();
let currentPurpose = '집 주변';

const resultEmpty = document.querySelector('#resultEmpty');
const resultFilled = document.querySelector('#resultFilled');
const recommendedTier = document.querySelector('#recommendedTier');
const selectedBranches = document.querySelector('#selectedBranches');
const tierRestriction = document.querySelector('#tierRestriction');
const routePurpose = document.querySelector('#routePurpose');

function renderRecommendation() {
  if (selected.size === 0) {
    resultEmpty.hidden = false;
    resultFilled.hidden = true;
    return;
  }

  const highestTier = Math.max(...selected.values());
  resultEmpty.hidden = true;
  resultFilled.hidden = false;
  recommendedTier.textContent = tierNames[highestTier];
  selectedBranches.textContent = [...selected.keys()].join(' · ');
  tierRestriction.textContent = tierRestrictions[highestTier];
  routePurpose.textContent = `${currentPurpose} 기준`;
}

document.querySelectorAll('.branch-option').forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.dataset.branch;
    const tier = Number(button.dataset.tier);
    if (selected.has(name)) {
      selected.delete(name);
      button.classList.remove('selected');
      button.setAttribute('aria-pressed', 'false');
      button.querySelector('.check').textContent = '+';
    } else {
      selected.set(name, tier);
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      button.querySelector('.check').textContent = '✓';
    }
    renderRecommendation();
  });
});

document.querySelectorAll('.purpose-tab').forEach((button) => {
  button.addEventListener('click', () => {
    currentPurpose = button.dataset.purpose;
    document.querySelectorAll('.purpose-tab').forEach((item) => item.classList.toggle('active', item === button));
    renderRecommendation();
  });
});

document.querySelector('#resetSelection').addEventListener('click', () => {
  selected.clear();
  document.querySelectorAll('.branch-option').forEach((button) => {
    button.classList.remove('selected');
    button.setAttribute('aria-pressed', 'false');
    button.querySelector('.check').textContent = '+';
  });
  renderRecommendation();
});

const tabCopy = {
  weekday: '회사 근처 지점에서 퇴근 후 운동하고, 같은 멤버십으로 집 근처 이용 가능 지점을 확인합니다.',
  weekend: '주말에는 집 주변 지점을 선택해 이동 시간을 줄이고, 꾸준한 운동 루틴을 이어갑니다.',
  travel: '출장이나 이동 전 목적지 인근 지점의 등급과 운영 정보를 확인해 운동 계획을 세웁니다.'
};

document.querySelectorAll('.membership-tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.membership-tab').forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    document.querySelector('#membershipTabCopy').textContent = tabCopy[button.dataset.tab];
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
menuToggle.addEventListener('click', () => {
  const open = primaryNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

primaryNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});
